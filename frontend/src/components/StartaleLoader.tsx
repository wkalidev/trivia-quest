"use client";
import dynamic from "next/dynamic";

const StartaleAutoConnect = dynamic(
  () => import("./StartaleAutoConnect"),
  { ssr: false }
);

export default function StartaleLoader() {
  return <StartaleAutoConnect />;
}
