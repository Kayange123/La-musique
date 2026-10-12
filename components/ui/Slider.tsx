import * as RadixSlider from "@radix-ui/react-slider";

interface SliderProps {
  value?: number;
  max?: number;
  step?: number;
  label: string;
  // Spoken by screen readers instead of the raw number, e.g. "1:05 of 3:20".
  valueText?: string;
  onChange?: (value: number) => void;
  // Fires once when the user lets go, after any dragging.
  onCommit?: (value: number) => void;
}

const Slider = ({
  value = 1,
  max = 1,
  step = 0.1,
  label,
  valueText,
  onChange,
  onCommit,
}: SliderProps) => {
  return (
    <RadixSlider.Root
      value={[value]}
      onValueChange={(newValue) => onChange?.(newValue[0])}
      onValueCommit={(newValue) => onCommit?.(newValue[0])}
      max={max}
      step={step}
      className="group relative flex items-center select-none touch-none w-full h-10"
    >
      <RadixSlider.Track className="bg-neutral-600 relative grow rounded-full h-[3px]">
        <RadixSlider.Range className="absolute bg-white group-hover:bg-green-500 rounded-full h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        aria-label={label}
        aria-valuetext={valueText}
        className="block h-3 w-3 rounded-full bg-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500"
      />
    </RadixSlider.Root>
  );
};

export default Slider;
