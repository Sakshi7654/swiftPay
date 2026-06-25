import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";
import { authOptions } from "../../lib/auth";

//backend endpoint, returning json not html, 
// telling whether user is logged in or not 
//if yes return user details

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);

    // If session or session.user is completely missing/null
    if (!session || !session.user) {
      return NextResponse.json({
        message: "You are not logged in"
      }, {
        status: 403
      });
    }

    return NextResponse.json({
      user: session.user
    });

  } catch (error) {
    console.error("API_AUTH_USER_ERROR:", error);

    return NextResponse.json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, {
      status: 500
    });
  }
};