/* eslint-disable react/prop-types */
import { useRef } from "react";

function AutoGrowTextarea({ id, value, onChange }) {
  const ref = useRef(null);

  const handleChange = (e) => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
    onChange(e.target.value);
  };

  return (
    <textarea
      ref={ref}
      id={id}
      rows={3}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#356C99] focus:border-transparent transition-colors"
      value={value}
      onChange={handleChange}
    />
  );
}

function Question({ title, attrs, options, questionType, selected, onUpdate }) {
  const handleChange = (value) => {
    if (questionType === "optional" || questionType === "or") {
      const newSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      onUpdate(newSelected);
    } else if (questionType === "alternative") {
      onUpdate([parseInt(value)]);
    }
  };

  const handleTextChange = (id, text, featureType) => {
    if (questionType === "alternative") {
      if (text !== "") {
        onUpdate([{ id, value: text, type: featureType }]);
      } else {
        onUpdate([]);
      }
    } else {
      const filtered = selected.filter((item) => {
        if (typeof item === "object") return item.id !== id;
        return item !== id;
      });
      if (text !== "") {
        onUpdate([...filtered, { id, value: text, type: featureType }]);
      } else {
        onUpdate(filtered);
      }
    }
  };

  const isOrInvalid = questionType === "or" && selected.length === 0;
  const isInputOption = (option) =>
    ["string", "integer", "real"].includes(option.featureType?.toLowerCase());

  const hasInputs = options?.some(isInputOption);
  const useDropdownForAlternative = !hasInputs && options?.length > 4;

  const renderInputField = (option, index) => {
    const selectedItem = selected.find(
      (item) => typeof item === "object" && item.id === option.id
    );
    const val = selectedItem ? selectedItem.value : "";
    const isString = option.featureType?.toLowerCase() === "string";
    const inputId = `input-${option.id}`;

    return (
      <div key={index} className="flex flex-col gap-1.5 mb-3">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-800">
          {option.optionAttrs?.option ? option.optionAttrs.option : option.name}
        </label>
        {option.optionAttrs?.desc && (
          <p className="text-xs text-gray-500">{option.optionAttrs.desc}</p>
        )}
        {isString ? (
          <AutoGrowTextarea
            id={inputId}
            value={val}
            onChange={(text) => handleTextChange(option.id, text, option.featureType)}
          />
        ) : (
          <input
            id={inputId}
            type="number"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#356C99] focus:border-transparent transition-colors"
            value={val}
            onChange={(e) => handleTextChange(option.id, e.target.value, option.featureType)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-l-4 border-[#356C99] pl-4">
        <h2 className="text-xl font-semibold text-gray-900">{attrs?.question ? attrs.question : title}</h2>
        {attrs?.desc && (
          <p className="mt-1 text-sm text-gray-600">{attrs.desc}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {questionType === "optional" || questionType === "or" ? (
          <>
            {options?.map((option, index) => {
              if (isInputOption(option)) return renderInputField(option, index);

              const isMandatory = option.mandatory === true;

              return (
                <label
                  key={index}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    isMandatory
                      ? "border-green-300 bg-green-50 cursor-not-allowed opacity-80"
                      : "border-gray-200 bg-white cursor-pointer hover:border-[#356C99] hover:bg-blue-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[#356C99] shrink-0"
                    value={option.id}
                    checked={isMandatory || selected.includes(option.id)}
                    onChange={() => !isMandatory && handleChange(option.id)}
                    disabled={isMandatory}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-sm font-medium ${isMandatory ? "text-green-700" : "text-gray-900"}`}>
                      {option.optionAttrs?.option ? option.optionAttrs.option : option.name}
                      {isMandatory && <span className="ml-2 text-xs text-green-600">(mandatory)</span>}
                    </span>
                    {option.optionAttrs?.desc && (
                      <span className="text-xs text-gray-500">
                        {option.optionAttrs.desc}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
            {isOrInvalid && (
              <p className="text-sm text-red-600 mt-1">
                Please select at least one option.
              </p>
            )}
          </>
        ) : questionType === "alternative" && !useDropdownForAlternative ? (
          <>
            {options?.map((option, index) => {
              if (isInputOption(option)) return renderInputField(option, index);

              const isChecked = selected.some((item) =>
                typeof item === "object" ? item.id === option.id : item === option.id
              );

              return (
                <label
                  key={index}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    isChecked
                      ? "border-[#356C99] bg-blue-50"
                      : "border-gray-200 bg-white hover:border-[#356C99] hover:bg-blue-50"
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-0.5 h-4 w-4 accent-[#356C99] shrink-0"
                    name={`alternative-${title}`}
                    value={option.id}
                    checked={isChecked}
                    onChange={() => handleChange(option.id)}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-gray-900">
                      {option.optionAttrs?.option ? option.optionAttrs.option : option.name}
                    </span>
                    {option.optionAttrs?.desc && (
                      <span className="text-xs text-gray-500">
                        {option.optionAttrs.desc}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </>
        ) : questionType === "alternative" && useDropdownForAlternative ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dropdown-select" className="text-sm font-medium text-gray-700">
              Select an option
            </label>
            <select
              id="dropdown-select"
              value={selected.length > 0 ? selected[0] : -1}
              className="w-max rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#356C99] focus:border-transparent transition-colors"
              onChange={(e) => handleChange(e.target.value)}
            >
              <option value={-1} disabled>
                Select an option…
              </option>
              {options?.map((option, index) => (
                <option key={index} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Question;