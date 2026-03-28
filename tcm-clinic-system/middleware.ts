import { NextRequest, NextResponse } from "next/server";

type AuthMeResponse = {
  role?: string;
  staffRole?: string;
  staff?: {
    staff_role?: string;
  };
};

const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/adminlogin"]);

function getRequiredArea(pathname: string) {
  if (pathname.startsWith("/patient")) {
    return "patient";
  }

  if (pathname.startsWith("/doctor")) {
    return "doctor";
  }

  if (pathname.startsWith("/med-assist")) {
    return "med-assistant";
  }

  return null;
}

function getResolvedRole(user: AuthMeResponse | null) {
  if (!user) {
    return null;
  }

  if (user.role === "PATIENT") {
    return "patient";
  }

  const staffRole = user.staffRole ?? user.staff?.staff_role;

  if (user.role === "STAFF" && staffRole === "DOCTOR") {
    return "doctor";
  }

  if (user.role === "STAFF" && staffRole === "MED_ASSISTANT") {
    return "med-assistant";
  }

  return null;
}

async function getCurrentUser(request: NextRequest) {
  const cookie = request.headers.get("cookie");

  if (!cookie) {
    return null;
  }

  try {
    const response = await fetch(new URL("/api/auth/me", request.url), {
      headers: {
        cookie,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuthMeResponse;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getCurrentUser(request);
  const resolvedRole = getResolvedRole(user);

  if (pathname === "/" && resolvedRole) {
    if (resolvedRole === "patient") {
      return NextResponse.redirect(new URL("/patient", request.url));
    }

    if (resolvedRole === "doctor") {
      return NextResponse.redirect(new URL("/doctor", request.url));
    }

    if (resolvedRole === "med-assistant") {
      return NextResponse.redirect(new URL("/med-assist", request.url));
    }
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const requiredArea = getRequiredArea(pathname);

  if (!requiredArea) {
    return NextResponse.next();
  }

  if (!resolvedRole) {
    return NextResponse.rewrite(new URL("/__not-found", request.url), {
      status: 404,
    });
  }

  if (resolvedRole !== requiredArea) {
    return NextResponse.rewrite(new URL("/__not-found", request.url), {
      status: 404,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
