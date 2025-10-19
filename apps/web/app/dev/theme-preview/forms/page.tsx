"use client"

import * as React from "react"

import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Select from "@/components/ui/Select"
import Combobox from "@/components/ui/Combobox"
import Checkbox from "@/components/ui/Checkbox"
import Radio from "@/components/ui/Radio"
import Switch from "@/components/ui/Switch"
import FileInput from "@/components/ui/FileInput"
import DateInput from "@/components/ui/DateInput"
import FormField from "@/components/ui/FormField"
import Fieldset from "@/components/ui/Fieldset"

export default function FormsPreview() {
  const [checked, setChecked] = React.useState(true)
  const [choice, setChoice] = React.useState("a")
  const [enabled, setEnabled] = React.useState(true)

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Forms Preview</h1>

      <Fieldset legend="Inputs">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Text input" htmlFor="inp1">
            <Input id="inp1" placeholder="Type here…" />
          </FormField>
          <FormField label="Date" htmlFor="date1">
            <DateInput id="date1" />
          </FormField>
          <FormField label="Textarea" htmlFor="ta1">
            <Textarea id="ta1" rows={4} placeholder="Write something…" />
          </FormField>
          <FormField label="Select" htmlFor="sel1">
            <Select id="sel1" defaultValue="">
              <option value="" disabled>Choose…</option>
              <option value="a">Option A</option>
              <option value="b">Option B</option>
            </Select>
          </FormField>
          <FormField label="Combobox" htmlFor="cb1" hint="Acts like an input with role=combobox">
            <Combobox id="cb1" placeholder="Start typing…" />
          </FormField>
          <FormField label="File input" htmlFor="file1">
            <FileInput id="file1" />
          </FormField>
        </div>
      </Fieldset>

      <Fieldset legend="Choices">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <FormField label="Checkbox">
              <label className="inline-flex items-center gap-2">
                <Checkbox checked={checked} onChange={(e) => setChecked(e.currentTarget.checked)} />
                <span>Subscribe to updates</span>
              </label>
            </FormField>

            <FormField label="Switch">
              <Switch checked={enabled} onClick={() => setEnabled((v) => !v)} />
            </FormField>
          </div>

          <div className="space-y-2">
            <FormField label="Radio group">
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2">
                  <Radio name="rg" checked={choice === "a"} onChange={() => setChoice("a")} />
                  <span>Choice A</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <Radio name="rg" checked={choice === "b"} onChange={() => setChoice("b")} />
                  <span>Choice B</span>
                </label>
              </div>
            </FormField>
          </div>
        </div>
      </Fieldset>

      <p className="text-sm text-foreground/70">
        Tab through controls: focus shows a subtle shadow + border emphasis. No halo. Space/Enter toggles where applicable.
      </p>
    </div>
  )
}
