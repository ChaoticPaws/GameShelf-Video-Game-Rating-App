import React from 'react';

const Spinner = () => {
  return (
    <div className="flex gap-3 items-center justify-center p-4">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="relative w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center"
        >
          <div
            className="bg-black w-3 h-3 rounded-full"
            style={{
              animation: 'pupil-move 1s ease-in-out infinite',
            }}
          />
        </div>
      ))}

      <style>{`
        @keyframes pupil-move {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default Spinner;
