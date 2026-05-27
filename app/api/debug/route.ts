import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET /api/debug
 * Returns auth status + session count in MongoDB for the logged-in user.
 * Remove this route after debugging is complete.
 */
export async function GET() {
  try {
    const jwt = await getAuthUser();

    if (!jwt) {
      return NextResponse.json({
        authenticated: false,
        message: "No valid fv_token cookie found — session saves will fail",
      });
    }

    const db = await getDb();
    const sessions = db.collection("sessions");

    // Count sessions for this user stored as ObjectId
    const countAsObjectId = await sessions.countDocuments({
      userId: new ObjectId(jwt.sub),
    });

    // Count sessions stored as plain string (legacy)
    const countAsString = await sessions.countDocuments({
      userId: jwt.sub,
    });

    // Get the 3 most recent sessions
    const recent = await sessions
      .find({ userId: new ObjectId(jwt.sub) })
      .sort({ createdAt: -1 })
      .limit(3)
      .project({ fluency_score: 1, createdAt: 1, severity: 1 })
      .toArray();

    return NextResponse.json({
      authenticated: true,
      userId: jwt.sub,
      role: jwt.role,
      name: jwt.name,
      sessionsInMongoDB: countAsObjectId,
      sessionsAsString: countAsString,
      recentSessions: recent.map((s) => ({
        id: s._id.toString(),
        fluency_score: s.fluency_score,
        severity: s.severity,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    console.error("Debug route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
