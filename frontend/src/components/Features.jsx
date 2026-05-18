import { useState } from "react";
import { TestimonialCard } from "./ui/testimonial-cards";

const testimonials = [
  {
    id: "1573496339141-b6c86cb3f56e",
    testimonial: "I feel like I've learned as much from LeaveFlow as I did completing my masters. It's the first thing I check every morning.",
    author: "Jenn F. - HR Director @ Square"
  },
  {
    id: "1535713875002-d1d0cf377fde", 
    testimonial: "My boss thinks I know what I'm doing. Honestly, I just rely on this automated workflow engine.", 
    author: "Adrian Y. - Operations @ Meta"
  },
  {
    id: "1560250097001-be0f96e236b2",
    testimonial: "Cannot believe how much time this saves. If LeaveFlow was $5,000 a month, it would be worth every penny.",
    author: "Devin R. - Growth Lead @ OpenAI"
  }
];

export default function Features() {
  const [positions, setPositions] = useState(["front", "middle", "back"]);

  const handleShuffle = () => {
    const newPositions = [...positions];
    newPositions.unshift(newPositions.pop());
    setPositions(newPositions);
  };

  return (
    <section className="py-24 bg-background overflow-hidden relative isolate">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
        
        {/* Left Side: Text / Context */}
        <div className="flex-1 space-y-6 z-10">
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Trusted by Modern Teams
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            See what industry leaders are saying about how LeaveFlow has completely transformed their HR and payroll automation. 
            Drag the cards to shuffle through the testimonials.
          </p>
        </div>

        {/* Right Side: Interactive Cards */}
        <div className="flex-1 h-[550px] w-full flex justify-center items-center relative z-10">
          <div className="relative h-[450px] w-[350px]">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                {...testimonial}
                handleShuffle={handleShuffle}
                position={positions[index]}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
