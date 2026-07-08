const steps = ["Sender", "Receiver", "Order", "Courier", "Boxes"];

export default function Stepper({
  step,
  setStep,
}: {
  step: number;
  setStep: (step: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {steps.map((label, index) => {
        const active = index === step;
        const completed = index < step;

        return (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            className={[
              "rounded-2xl border px-3 py-3 text-xs font-semibold transition",
              active
                ? "border-[#9AF000] bg-[#9AF000] text-black"
                : completed
                  ? "border-[#9AF000]/40 bg-[#9AF000]/10 text-[#9AF000]"
                  : "border-white/10 bg-[#101010] text-white/50",
            ].join(" ")}
          >
            {index + 1}. {label}
          </button>
        );
      })}
    </div>
  );
}