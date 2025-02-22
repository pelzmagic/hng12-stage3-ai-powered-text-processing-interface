// eslint-disable-next-line react/prop-types
export default function TextArea({ text, setText, onSend }) {
  return (
    <div className="w-[90%] mx-auto absolute bottom-[5%] left-1/2 -translate-x-1/2 flex justify-between items-center">
      <textarea
        placeholder="Tell me your mind?"
        className="border border-slate-700 outline-none focus:border-amber-400 focus:ring rounded-lg w-[90%] focus:ring-amber-100 p-1"
        value={text}
        onChange={(e) => setText(e.target.value)}></textarea>
      <div onClick={onSend}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
        </svg>
      </div>
    </div>
  );
}
