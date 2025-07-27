import { useState } from 'react';

export default function ConsentModal({ onAgree }: { onAgree: () => void }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow max-w-md">
        <h2 className="text-xl font-bold mb-4">Welcome to MedGPT</h2>
        <p className="mb-4">
          MedGPT is an AI-powered assistant and does not replace professional medical advice.
          Please consult a healthcare provider for serious or personal concerns.
        </p>
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="mr-2"
          />
          I agree to the disclaimer and want to continue
        </label>
        <button
          onClick={onAgree}
          disabled={!agreed}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
