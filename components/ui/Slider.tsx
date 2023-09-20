import * as RadixSlider from "@radix-ui/react-slider";
interface SliderProps {
  value?: number;
  onChange?: (value: number) => void;
}
const Slider = ({ value = 1, onChange }: SliderProps) => {
  const handleChange = (newValue: number[]) => {
    onChange?.(newValue[0]);
  };
  return (
    <RadixSlider.Root
      value={[value]}
      defaultValue={[1]}
      onValueChange={handleChange}
      max={1}
      step={0.1}
      aria-label="volume"
      className="relative flex items-center select-none touch-none w-full h-10"
    >
      <RadixSlider.Track className="bg-neutral-600 relative grow rounded-full h-[3px]">
        <RadixSlider.Range className="absolute bg-white rounded-full h-full cursor-pointer" />
      </RadixSlider.Track>
    </RadixSlider.Root>
  );
};

export default Slider;
