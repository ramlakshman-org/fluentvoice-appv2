import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { DbTreatmentPlan } from "@/lib/types";

/**
 * GET /api/treatment?patientId=xxx
 * Returns the treatment plan for a patient.
 * Accessible by the patient themselves OR their therapist.
 */
export async function GET(req: NextRequest) {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId") ?? jwt.sub;

    const db = await getDb();
    const plans = db.collection<DbTreatmentPlan>("treatment_plans");

    const plan = await plans.findOne({ patientId: new ObjectId(patientId) });
    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    return NextResponse.json({
      plan: {
        id: plan._id!.toString(),
        patientId: plan.patientId.toString(),
        therapistId: plan.therapistId?.toString(),
        goals: plan.goals,
        exercises: plan.exercises,
        remarks: plan.remarks,
        updatedAt: plan.updatedAt,
      },
    });
  } catch (err) {
    console.error("GET /api/treatment error:", err);
    return NextResponse.json({ error: "Failed to fetch treatment plan." }, { status: 500 });
  }
}

/**
 * PUT /api/treatment
 * Upserts a treatment plan.
 * Body: { patientId?, goals, exercises, remarks }
 * patientId defaults to the authenticated user's id.
 */
export async function PUT(req: NextRequest) {
  try {
    const jwt = await getAuthUser();
    if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const patientId = body.patientId ?? jwt.sub;
    const { goals, exercises, remarks } = body;

    const db = await getDb();
    const plans = db.collection<DbTreatmentPlan>("treatment_plans");

    const setFields: Record<string, unknown> = {
      goals: Array.isArray(goals) ? goals : (goals ?? "").split("\n").filter(Boolean),
      exercises: Array.isArray(exercises) ? exercises : (exercises ?? "").split("\n").filter(Boolean),
      remarks: remarks ?? "",
      updatedAt: new Date(),
    };

    if (jwt.role === "therapist") {
      setFields.therapistId = new ObjectId(jwt.sub);
    }

    await plans.updateOne(
      { patientId: new ObjectId(patientId) },
      {
        $set: setFields,
        $setOnInsert: { patientId: new ObjectId(patientId) },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/treatment error:", err);
    return NextResponse.json({ error: "Failed to save treatment plan." }, { status: 500 });
  }
}
