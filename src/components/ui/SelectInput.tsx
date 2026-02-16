import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { Check, ChevronDown, LucideIcon } from "lucide-react";
import { Fragment } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  icon?: LucideIcon;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string; // For container margins/width
  buttonClassName?: string; // For specific button overrides
}

export default function SelectInput({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  error,
  placeholder = "Pilih opsi...",
  disabled = false,
  className = "",
  buttonClassName = "",
}: SelectInputProps) {
  // Normalize options to objects
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <ListboxButton
            className={`
              relative w-full cursor-default rounded-xl bg-white 
              ${Icon ? "pl-11" : "pl-4"} pr-10 py-2.5 text-left border 
              transition-all outline-none
              focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
              ${
                error
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-200 hover:border-emerald-400"
              }
              ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "cursor-pointer"}
              ${buttonClassName}
            `}
          >
            <span
              className={`block truncate ${!selectedOption ? "text-gray-400" : "text-gray-900"}`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <ChevronDown
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
              {normalizedOptions.map((opt, personIdx) => (
                <ListboxOption
                  key={personIdx}
                  className={({ focus }) =>
                    `relative cursor-default select-none py-2.5 pl-10 pr-4 transition-colors ${
                      focus ? "bg-emerald-50 text-emerald-900" : "text-gray-900"
                    }`
                  }
                  value={opt.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {opt.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
