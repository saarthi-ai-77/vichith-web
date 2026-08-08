import { useState } from "react";
import { motion } from "framer-motion";
const logo = { url: "/favicon_io/android-chrome-192x192.png" };

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  return (
    <section id="waitlist" className="relative overflow-hidden border-t border-line">
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-60 left-1/2 h-[40rem] w-[70rem] -translate-x-1/2 rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 16%, transparent), transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-[1180px] px-6 py-32 text-center md:py-44">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-[13px] text-accent"
        >
          <span>Early Access Waitlist</span>
          <span>·</span>
          <span>AI Editing Operating System</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-4xl leading-[1.03] font-medium md:text-7xl"
        >
          The workspace where
          <br />
          <span className="accent-text">video gets made.</span>
        </motion.h2>
        <p className="mx-auto mt-6 max-w-md text-dim">
          Official launch waitlist. Built with creators, powered by Chithra Editorial Brain.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email.includes("@")) {
              setStatus("error");
              setMsg("Enter a valid email address.");
              return;
            }
            setStatus("loading");
            try {
              const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              if (res.ok) {
                setStatus("success");
                setMsg("You're on the list. We'll be in touch soon.");
                setEmail("");
              } else {
                setStatus("error");
                setMsg("Something went wrong. Please try again.");
              }
            } catch (err) {
              setStatus("error");
              setMsg("Failed to join waitlist. Please try again.");
            }
          }}
          className="mx-auto mt-10 flex w-full max-w-md flex-col gap-2 sm:flex-row"
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@studio.com"
            className="h-12 flex-1 rounded-full border border-line-strong bg-white/[0.03] px-5 text-[14px] outline-none transition-colors duration-500 placeholder:text-dim focus:border-accent/50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-12 rounded-full bg-accent px-6 text-[14px] font-medium text-accent-foreground transition-transform duration-500 hover:scale-[1.03]"
          >
            {status === "loading" ? "Joining..." : "Join Waitlist"}
          </button>
        </form>
        {msg && (
          <p className={`mt-3 text-xs ${status === "error" ? "text-red-400" : "text-accent"}`}>
            {msg}
          </p>
        )}
      </div>

      <footer className="relative border-t border-line">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <img src={logo.url} alt="Vichith" className="h-6 w-6" />
            <span className="font-display text-[15px] tracking-tight">vichith</span>
          </div>
          <div className="flex flex-wrap gap-6 text-[13px] text-dim sm:ml-auto">
            {[
              ["Workflow", "#workflow"],
              ["Studio", "#studio"],
              ["Chithra AI", "#chithra"],
              ["Registry", "#registry"],
              ["Docs", "#docs"],
            ].map(([label, href]) => (
              <a key={label} href={href} className="transition-colors hover:text-foreground">
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-[1180px] px-6 pb-10 font-mono text-[11px] text-dim">
          © {new Date().getFullYear()} Vichith AI — One workflow. Every creative tool. Powered by AI.
        </div>
      </footer>
    </section>
  );
}