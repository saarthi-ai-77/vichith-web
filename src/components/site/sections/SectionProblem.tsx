"use client";

import { motion } from "framer-motion";

export function SectionProblem() {
  return (
    <section className="relative w-full flex flex-col items-center justify-center min-h-[90vh] fluid-px fluid-py overflow-hidden border-t border-white/5">
      
      <div className="z-10 flex flex-col items-center text-center max-w-[800px] mb-20 md:mb-32">
        <h2 className="text-4xl md:text-[56px] font-semibold leading-[1.1] tracking-tight">
          Making the video is harder than generating the clip.
        </h2>
        <p className="mt-6 text-lg md:text-xl text-secondary leading-relaxed">
          Generating a video is only one step. Planning the idea, managing references, creating multiple shots, organizing assets, editing the timeline, and iterating when something changes still happens across disconnected tools.
        </p>
      </div>

      {/* Scattered Fragment Visual */}
      <div className="relative w-full max-w-[1000px] h-[400px] flex items-center justify-center">
        {/* Background paths indicating broken connections */}
        <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
          <path d="M 200 100 Q 400 150 600 50" stroke="var(--color-line)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
          <path d="M 300 300 Q 500 200 800 250" stroke="var(--color-line)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
          <path d="M 100 250 Q 300 50 700 350" stroke="var(--color-line)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
        </svg>

        {/* Scattered UI nodes */}
        <motion.div 
          className="absolute top-[10%] left-[10%] glass px-6 py-3 rounded-lg shadow-float"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">IDEA</span>
        </motion.div>

        <motion.div 
          className="absolute top-[5%] right-[25%] panel px-6 py-3 rounded-lg shadow-float border-accent/20"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="font-mono text-xs text-accent tracking-widest uppercase">PROMPTS</span>
        </motion.div>

        <motion.div 
          className="absolute bottom-[20%] left-[25%] panel bg-surface px-6 py-3 rounded-lg shadow-float"
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">REFERENCES</span>
        </motion.div>

        <motion.div 
          className="absolute top-[40%] right-[10%] glass px-6 py-3 rounded-lg shadow-float"
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">GENERATOR</span>
        </motion.div>

        <motion.div 
          className="absolute bottom-[10%] right-[30%] panel border-white/10 px-6 py-3 rounded-lg shadow-float"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <span className="font-mono text-xs text-primary tracking-widest uppercase">EDITOR</span>
        </motion.div>
        
        <motion.div 
          className="absolute top-[35%] left-[40%] panel bg-surface px-6 py-3 rounded-lg shadow-float border-dashed"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span className="font-mono text-xs text-secondary tracking-widest uppercase">ASSETS FOLDER</span>
        </motion.div>
      </div>

    </section>
  );
}
