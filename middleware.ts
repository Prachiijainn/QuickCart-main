import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// Define protected routes and required permissions
const sellerRoutes = createRouteMatcher(["/seller(.*)"]);
const cartRoutes = createRouteMatcher(["/cart(.*)"]);
const checkoutRoutes = createRouteMatcher(["/checkout(.*)"]);
const myOrdersRoutes = createRouteMatcher(["/my-orders(.*)"]);
const setSellerRoleRoute = createRouteMatcher(["/set-seller-role(.*)"]);
// const invoiceRoutes = createRouteMatcher(["/dashboard/invoices(.*)"]);
// const salaryRoutes = createRouteMatcher(["/dashboard/salary(.*)"]);
// const settingsRoutes = createRouteMatcher(["/dashboard/settings(.*)"]);
// const documentRoutes = createRouteMatcher([
//   "/dashboard/documents(.*)",
//   "/dashboard/templates/documents(.*)",
// ]);


export default clerkMiddleware(async (auth, req: NextRequest) => {

  const response = NextResponse.next();

  const { userId } = await auth();

  // // Redirect to sign-in if not authenticated
  // if (!userId) {
  //   auth.protect();
  //   return;
  // }

  const client = await clerkClient();
  let user
  if (userId){
    user = await client.users.getUser(userId);
  }

  const userRoles = user ? Array.isArray(user?.privateMetadata.roles)
    ? (user?.privateMetadata.roles as string[])
    : []:[];
  // const userPermissions = Array.isArray(user.privateMetadata.permissions)
  //   ? (user.privateMetadata.permissions as string[])
  //   : [];


  // Check if user is a superadmin (superadmins have access to all routes)

  // Special handling for seller routes - redirect to home if not logged in or not a seller
  if(sellerRoutes(req)) {
    if (!userId) {
      // Redirect to home instead of showing login page
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Regular authentication for other protected routes
  if(cartRoutes(req) || myOrdersRoutes(req) || checkoutRoutes(req)) {
    if (!userId) {
      auth.protect();
      return;
    }
  }
  
  // Separate authentication for set-seller-role - requires auth but not seller role
  if(setSellerRoleRoute(req)) {
    if (!userId) {
      auth.protect();
      return;
    }
  }
  
  // Check both privateMetadata.roles and publicMetadata.role for seller role
  const isSeller = userRoles.includes("seller") || user?.publicMetadata?.role === 'seller';

  if (sellerRoutes(req)) {
    if (!isSeller) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // if (invoiceRoutes(req)) {
  //   if (!isSuperAdmin && !userPermissions.includes("invoices.access")) {
  //     return NextResponse.redirect(new URL("/dashboard", req.url));
  //   }
  // }

  // if (salaryRoutes(req)) {
  //   if (!isSuperAdmin && !userPermissions.includes("salary.access")) {
  //     return NextResponse.redirect(new URL("/dashboard", req.url));
  //   }
  // }

  // if (settingsRoutes(req)) {
  //   if (!isSuperAdmin && !userPermissions.includes("settings.access")) {
  //     return NextResponse.redirect(new URL("/dashboard", req.url));
  //   }
  // }

  // if (documentRoutes(req)) {
  //   if (!isSuperAdmin && !userPermissions.includes("documents.access")) {
  //     return NextResponse.redirect(new URL("/dashboard", req.url));
  //   }
  // }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};