"use client";
import dynamic from "next/dynamic";

const FarcasterAutoConnect = dynamic(
  () => import("./FarcasterAutoConnect"),
  { ssr: false }
);

export default function FarcasterLoader() {
  return <FarcasterAutoConnect />;
}
