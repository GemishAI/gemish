"use client";

import { useSidebar, SidebarTrigger } from "../ui/sidebar";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

export function ClosedNav() {
  const { state } = useSidebar();

  return (
    <AnimatePresence mode="wait">
      {state !== "expanded" && (
        <motion.div
          key="closed-nav"
          className="lg:flex hidden flex-col justify-between h-screen sticky left-0 inset-y-0 px-5 py-4"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.h1
            className="text-lg font-semibold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Link href="/chat">Gemish</Link>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <SidebarTrigger />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
