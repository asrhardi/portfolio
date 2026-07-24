import {useEffect, useState} from "react";

export const LoadingScreen = ({onComplete}) => {
    const [text, setText] = useState("");
    const fullText = "< {...} Ace-ft-Nemo />";

    useEffect(() => {
        let index = 0;
        const interval = setInterval( () => {
            setText(fullText.substring(0, index));
            index++;

            if (index > fullText.length){
                clearInterval(interval)

                setTimeout(() => {
                    onComplete();
                }, 1000)
            }
        }, 100)
        return () => clearInterval(interval)
    }, [onComplete]);
    return(
    <div className="fixed inset-0 z-50 bg-[var(--bg)] text-[var(--heading)] flex flex-col items-center justify-center">
        <div className="mb-4 text-3xl md:text-4xl font-mono font-bold">
            {text}<span className="animate-blink ml-1">|</span>
        </div>

        <div className="w-[200px] h-0.5 bg-[var(--line-2)] rounded relative overflow-hidden">
            <div className="w-[40%] h-full bg-[var(--accent)] shadow-[0_0_15px_var(--accent)] animate-loading-bar">
            </div>
        </div>
    </div>
    )
}