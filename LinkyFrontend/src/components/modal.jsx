const Modal = ({ isOpen, onClose, children, onBackdropClick = null }) => {
  let handleChildClick = (e) => {
    e.stopPropagation();
  }
  return (
    <div className={"fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center transition duration-300 ease-in-out " + (isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={onBackdropClick}>
      <div className="bg-gray-800 p-6 rounded text-white relative">
        { onBackdropClick === null && (
          <button onClick={onClose} className="absolute top-0 right-0 m-2 text-gray-400 hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div onClick={handleChildClick}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
