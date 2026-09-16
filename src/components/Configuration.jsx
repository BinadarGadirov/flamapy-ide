/* eslint-disable react/prop-types */
function Configuration({ configuration }) {
  const selected = [];
  const excluded = [];
  const undecided = [];

  Object.entries(configuration).forEach(([feature, status]) => {
    if (status === true) selected.push(feature);
    else if (status === false) excluded.push(feature);
    else if (status === null || status === undefined) undecided.push(feature);
  });

  return (
    <div className="flex flex-col gap-4">

      <div className="rounded-xl bg-gray-800 dark:bg-gray-800 px-4 py-4 flex flex-col gap-4">
        <div className="text-xl font-bold text-white">Feature Configuration</div>

        {selected.length > 0 && (
          <div>
            <p className="text-green-400 font-semibold mb-1">Selected Features:</p>
            <ul className="list-disc list-inside text-white text-sm flex flex-col gap-1">
              {selected.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        {excluded.length > 0 && (
          <div>
            <p className="text-red-400 font-semibold mb-1">Deselected Features:</p>
            <ul className="list-disc list-inside text-white text-sm flex flex-col gap-1">
              {excluded.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        {undecided.length > 0 && (
          <div>
            <p className="text-yellow-400 font-semibold mb-1">Undecided Features:</p>
            <ul className="list-disc list-inside text-white text-sm flex flex-col gap-1">
              {undecided.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Configuration;