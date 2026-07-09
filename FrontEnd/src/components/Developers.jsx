"use client";
// Import animation, icons and reusable UI components
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomImage } from "./CustomImage"; // Using your CustomImage component
import { useEffect, useState } from "react";
import FloatingDockDesktop from "./FloatingDockDesktop";

export const Developers = ({ autoplay = false }) => {
  const [active, setActive] = useState(0);
  const testimonials = [
    {
      quote:
        "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
      name: "Revanth Kurapati",
      designation: "Member of GDG IIIT LUCKNOW",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
      name: "Purna Tadikonda",
      designation: "Member of AXIOS IIIT LUCKNOW",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Srinidhi Kukkudapu",
      designation: "Memeber of Women in Tech IIIT LUCKNOW",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote:
        "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: "Siddharth Paladi",
      designation: "Sophomore at IIIT LUCKNOW",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },

  ];

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index) => {
    return index === active;
  };

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  return (
    <div>
      <div className="bg-[#02192D] h-screen select-none">
        <div className=" max-w-sm md:max-w-4xl mx-auto antialiased font-sans px-4 md:px-8 lg:px-12 py-30">
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-20">
            <div>
              <div className="relative h-80 w-full">
                <AnimatePresence>
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.src}
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                        z: -100,
                        rotate: randomRotateY(),
                      }}
                      animate={{
                        opacity: isActive(index) ? 1 : 0.7,
                        scale: isActive(index) ? 1 : 0.95,
                        z: isActive(index) ? 0 : -100,
                        rotate: isActive(index) ? 0 : randomRotateY(),
                        zIndex: isActive(index)
                          ? 999
                          : testimonials.length + 2 - index,
                        y: isActive(index) ? [0, -80, 0] : 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        z: 100,
                        rotate: randomRotateY(),
                      }}
                      transition={{
                        duration: 0.4,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 origin-bottom">
                      <CustomImage
                        src={testimonial.src}
                        alt={testimonial.name}
                        width={300}
                        height={300}
                        draggable={false}
                        className="h-full w-full rounded-3xl"
                        objectFit="cover"
                        objectPosition="center"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex justify-between flex-col py-4">
              <motion.div
                key={active}
                initial={{
                  y: 20,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                exit={{
                  y: -20,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}>
                <h3 className="text-2xl font-bold dark:text-white text-white">
                  {testimonials[active].name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-neutral-500">
                  {testimonials[active].designation}
                </p>
                <motion.p className="text-lg text-gray-500 mt-8 dark:text-neutral-300">
                  {testimonials[active].quote.split(" ").map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{
                        filter: "blur(10px)",
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        filter: "blur(0px)",
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeInOut",
                        delay: 0.02 * index,
                      }}
                      className="inline-block">
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </motion.p>
              </motion.div>
              <div className="flex gap-4 pt-12 md:pt-0">
                <button
                  onClick={handlePrev}
                  className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center group/button">
                  <IconArrowLeft
                    className="h-5 w-5 text-black dark:text-neutral-400 group-hover/button:rotate-12 transition-transform duration-300" />
                </button>
                <button
                  onClick={handleNext}
                  className="h-7 w-7 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center group/button">
                  <IconArrowRight
                    className="h-5 w-5 text-black dark:text-neutral-400 group-hover/button:-rotate-12 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FloatingDockDesktop
        visibleItems={{
          login: true,
          signup: true,
          home: true,
          docs: true,
          team: true,
          projects:true,
        }}
        className="fixed bottom-25 left-1/2 -translate-x-1/2 "
      />
    </div>



  );
};