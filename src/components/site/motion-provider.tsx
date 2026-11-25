"use client";

import { MotionConfig } from "motion/react";

/** Follows the visitor's "reduce motion" setting for every Motion animation on the page. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
