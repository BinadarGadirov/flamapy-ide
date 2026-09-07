/* eslint-disable react/prop-types */
function Configuration({ configuration, onUpdate }) {
  const categorizedConfig = {
    selected: [],
    excluded: [],
    undecided: [],
  };

  Object.entries(configuration).forEach(([feature, status]) => {
    if (status === false) {
      categorizedConfig.excluded.push(feature);
    } else if (status === null || status === undefined) {
      categorizedConfig.undecided.push(feature);
    } else {
      categorizedConfig.selected.push({ name: feature, value: status });
    }
  });

  const { selected, excluded, undecided } = categorizedConfig;

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="border-l-4 border-[#356C99] pl-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Feature Configuration
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Review and adjust your final configuration below.
        </p>
      </div>

      {/* Selected — prominent */}
      <div>
        <div className="border-l-4 border-green-500 pl-4 mb-3">
          <h3 className="text-base font-semibold text-gray-900">
            Selected Features
          </h3>
          <p className="text-xs text-gray-500">
            Features included in this configuration
          </p>
        </div>
        {selected.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selected.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 rounded-lg border border-green-200 bg-white px-4 py-3"
              >
                <span className="text-sm font-medium text-gray-900">
                  {item.name}
                </span>
                {typeof item.value === "string" ? (
                  <input
                    type="text"
                    aria-label={item.name}
                    value={item.value}
                    onChange={(e) => onUpdate(item.name, e.target.value)}
                    placeholder="Enter value…"
                    className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#356C99] focus:border-transparent transition-colors"
                  />
                ) : item.value !== true ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-mono border border-gray-200">
                    {item.value}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-green-600">
                    Enabled
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 pl-5">None</p>
        )}
      </div>

      {/* Excluded */}
      <div>
        <div className="border-l-4 border-red-400 pl-4 mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Excluded Features
          </h3>
        </div>
        {excluded.length > 0 ? (
          <div className="flex flex-wrap gap-2 pl-1">
            {excluded.map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200"
              >
                {feature}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 pl-5">None</p>
        )}
      </div>

      {/* Undecided */}
      <div>
        <div className="border-l-4 border-yellow-400 pl-4 mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Undecided Features
          </h3>
        </div>
        {undecided.length > 0 ? (
          <div className="flex flex-wrap gap-2 pl-1">
            {undecided.map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200"
              >
                {feature}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 pl-5">None</p>
        )}
      </div>
    </div>
  );
}

export default Configuration;
