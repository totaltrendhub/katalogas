import Slot from "./Slot";

export default function SlotGrid({ slots }) {
  return (
    <div
      className="
        grid gap-3
        grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-4 
        lg:grid-cols-5
      "
    >
      {slots.map((slot, index) => (
        <div 
          key={slot.id}
          style={{
            animationDelay: `${index * 0.05}s`,
          }}
        >
          <Slot slot={slot} />
        </div>
      ))}
    </div>
  );
}
