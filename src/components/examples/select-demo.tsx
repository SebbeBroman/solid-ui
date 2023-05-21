import { createSignal } from "solid-js"

import { ComponentExample } from "~/components/component-example"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select"

export function SelectDemo() {
  const [value, setValue] = createSignal("")
  return (
    <ComponentExample class="flex-col">
      <Select
        value={value()}
        onChange={setValue}
        options={["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]}
        placeholder="Select a fruit…"
        itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
      >
        <SelectTrigger aria-label="Fruit" class="w-[180px]">
          <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
      <p class="pt-2 text-sm text-gray-500">Your favorite fruit is: {value()}</p>
    </ComponentExample>
  )
}
