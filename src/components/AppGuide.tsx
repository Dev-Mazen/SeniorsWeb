"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    path: "/",
    selector: "center",
    title: "رحلة سريعة (Welcome)",
    content: "أهلاً بيك في منصة دفعة 26! دي جولة سريعة هنعرفك فيها على أهم الأماكن في الموقع عشان تعيش التجربة بالكامل. يالا بينا؟",
    icon: "flight_takeoff"
  },
  {
    path: "/",
    selector: "#tour-navigation",
    title: "قايمة التنقل (Menu)",
    content: "دي القايمة السريعة، من هنا هتقدر تروح لأي مكان في المنصة بضغطة زرار، سواء الذكريات، الجوايز، أو البورد.",
    icon: "navigation"
  },
  {
    path: "/memory-feed",
    selector: "main",
    title: "شريط الذكريات (Memory Feed)",
    content: "هنا بنجمع أحلى أوقاتنا! تقدر تتفرج على صور وفيديوهات الدفعة، وتقدر ترفع صورك معانا. متقلقش، كل حاجة بتتراجع عشان نحافظ على شكل الدفعة الجميل.",
    icon: "photo_library"
  },
  {
    path: "/wall",
    selector: "main",
    title: "بورد الحكايات (Chaos Board)",
    content: "البورد ده بتاعنا نكتب فيه اللي إحنا عايزينه! حط نوتة، اكتب إيفيه مشهور، أو رسالة من غير اسم (Anonymous). خد راحتك على الآخر.",
    icon: "sticky_note_2"
  },
  {
    path: "/awards",
    selector: "main",
    title: "تصويت الأوسكار (Senior Awards)",
    content: "وقت الجد! اختار صحابك في كل فئة لجوايز الدفعة. تصويتك سري جداً ومحدش هيعرف إنت اخترت مين، والنتايج هتتفتح في الحفلة الكبيرة!",
    icon: "workspace_premium"
  },
  {
    path: "/time-capsule",
    selector: "main",
    title: "كبسولة الزمن (Time Capsule)",
    content: "فكرة مجنونة للمستقبل.. اكتب رسالة لنفسك أو للدفعة كلها، مش هتقدر تشوفها تاني غير في سنة التجمع بتاعتنا في المستقبل. سيب ذكرى حلوة لنسختك المستقبلية.",
    icon: "hourglass_bottom"
  }
];

export default function AppGuide() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showOrb, setShowOrb] = useState(false);
  const [isTourMode, setIsTourMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const timer = setTimeout(() => setShowOrb(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("seniorweb_tour_completed");
    if (!hasSeenTour && !isAdmin && pathname) {
      const timer = setTimeout(() => {
        setIsTourMode(true);
        setIsOpen(true);
        const startIndex = steps.findIndex(s => s.path === pathname);
        setCurrentStepIndex(startIndex >= 0 ? startIndex : 0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pathname, isAdmin]);

  useEffect(() => {
    if (!isOpen) {
      setSpotlightRect(null);
      return;
    }

    let currentSelector = "center";
    if (isTourMode) {
      currentSelector = steps[currentStepIndex]?.selector || "center";
    }

    if (currentSelector !== "center") {
      const updateRect = () => {
        const el = document.querySelector(currentSelector);
        if (el) {
          setSpotlightRect(el.getBoundingClientRect());
        } else {
          setSpotlightRect(null);
        }
      };
      
      updateRect();
      window.addEventListener("resize", updateRect);
      window.addEventListener("scroll", updateRect, { passive: true });
      
      const observer = new MutationObserver(updateRect);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true });
      const interval = setInterval(updateRect, 500);

      return () => {
        window.removeEventListener("resize", updateRect);
        window.removeEventListener("scroll", updateRect);
        observer.disconnect();
        clearInterval(interval);
      };
    } else {
      setSpotlightRect(null);
    }
  }, [isOpen, isTourMode, currentStepIndex]);

  if (isAdmin || !pathname) return null;

  const currentGuide = isTourMode 
    ? steps[currentStepIndex] 
    : (steps.find(s => s.path === pathname) || {
        path: pathname,
        selector: "center",
        title: "دليل الدفعة",
        content: "المنصة دي معمولة مخصوص عشان دفعتنا! من القايمة تقدر تتنقل بين أقسام المنصة براحتك. أنا هنا دايماً لو عوزت مساعدة في أي وقت.",
        icon: "lightbulb"
      });

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      router.push(steps[nextIndex].path);
    } else {
      endTour();
    }
  };

  const endTour = () => {
    setIsTourMode(false);
    setIsOpen(false);
    localStorage.setItem("seniorweb_tour_completed", "true");
  };

  return (
    <>
      {/* Floating Action Orb */}
      <AnimatePresence>
        {showOrb && !isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 40 }}
            className="fixed bottom-8 left-8 z-50"
          >
            <button
              onClick={() => { setIsTourMode(false); setIsOpen(true); }}
              className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-lowest/80 backdrop-blur-3xl shadow-2xl border border-outline-variant/10 hover:scale-110 active:scale-90 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute inset-2 rounded-full border border-primary/20 animate-ping opacity-40" />
              <span className="material-symbols-outlined text-2xl text-primary relative z-10 group-hover:rotate-12 transition-transform">
                {isTourMode ? "flight_takeoff" : "lightbulb"}
              </span>
              
              <div className="absolute left-full ml-4 px-6 py-3 bg-on-surface text-background text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none translate-x-4 group-hover:translate-x-0">
                محتاج مساعدة؟
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide Interface */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none" dir="rtl">
            
            {/* Backdrop / Spotlight */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0 bg-background/60 backdrop-blur-sm pointer-events-auto"
              onClick={isTourMode ? undefined : () => setIsOpen(false)}
            />

            {spotlightRect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute z-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-[2rem] pointer-events-none shadow-[0_0_0_9999px_rgba(var(--background-rgb),0.8)]"
                style={{
                  top: spotlightRect.top - 16,
                  left: spotlightRect.left - 16,
                  width: spotlightRect.width + 32,
                  height: spotlightRect.height + 32,
                }}
              />
            )}

            <div className="absolute inset-0 z-10 pointer-events-auto" onClick={isTourMode ? undefined : () => setIsOpen(false)} />

            {/* Modal */}
            <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center p-4 sm:p-8 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-xl section-shell rounded-[3.5rem] p-1 shadow-2xl pointer-events-auto"
              >
                <div className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-[3.3rem] p-8 md:p-14 relative overflow-hidden">
                  
                  {/* Progress */}
                  {isTourMode && (
                    <div className="absolute top-8 left-0 right-0 flex justify-center gap-2 px-20">
                      {steps.map((_, idx) => (
                        <div key={idx} className={`h-1 rounded-full transition-all duration-700 ${idx === currentStepIndex ? "flex-1 bg-primary" : idx < currentStepIndex ? "w-4 bg-primary/30" : "w-4 bg-on-surface-variant/10"}`} />
                      ))}
                    </div>
                  )}

                  <div className="relative z-10 mt-6">
                    <div className="flex items-start justify-between mb-10">
                      <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10 group">
                        <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">{currentGuide.icon}</span>
                      </div>
                      
                      {!isTourMode && (
                        <button 
                          onClick={() => setIsOpen(false)}
                          className="w-12 h-12 rounded-full bg-surface-container-high/40 hover:bg-surface-container-high flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-on-surface text-lg">close</span>
                        </button>
                      )}
                    </div>

                    <h2 className="serif text-4xl md:text-5xl font-black text-on-surface tracking-tighter mb-6 leading-none">
                      {currentGuide.title}
                    </h2>
                    
                    <p className="text-xl text-on-surface-variant leading-relaxed font-medium min-h-[120px]">
                      {currentGuide.content}
                    </p>

                    <div className="mt-10 pt-10 border-t border-outline-variant/10 flex items-center justify-between gap-6">
                      {isTourMode ? (
                        <>
                          <button 
                            onClick={endTour}
                            className="px-8 py-5 text-on-surface-variant font-black text-[10px] uppercase tracking-[0.3em] hover:text-on-surface transition-colors active:scale-95"
                          >
                            تخطي (Skip)
                          </button>
                          <button 
                            onClick={handleNext}
                            className="group flex items-center gap-4 px-10 py-5 bg-on-surface text-background rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
                          >
                            <span>{currentStepIndex === steps.length - 1 ? "بداية الرحلة" : "التالي (Next)"}</span>
                            {currentStepIndex < steps.length - 1 && (
                              <span className="material-symbols-outlined text-lg group-hover:-translate-x-2 transition-transform">arrow_back</span>
                            )}
                          </button>
                        </>
                      ) : (
                        <div className="w-full flex justify-center">
                          <button 
                            onClick={() => setIsOpen(false)}
                            className="px-12 py-5 bg-on-surface text-background rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95"
                          >
                            فهمت، شكراً!
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
