import { SendIcon } from "lucide-react"

export const MessageList = ({messages, noPlaceholder}) => {
    return (
        messages.length === 0 && !noPlaceholder ? (
            <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3 max-w-md">
                    <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                        <SendIcon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground montserrat-font">Private Assistance</h3>
                    <p className="text-sm text-muted-foreground">
                        Ask questions in your language. All conversations stay on your device.
                    </p>
                </div>
            </div>

        ) : (
            messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                    <div
                        className={`max-w-[80%] rounded-md px-4 py-3 ${msg.role === "user"
                                ? "bg-accent text-accent-foreground"
                                : "bg-card border border-border text-card-foreground"
                            }`}
                    >
                        <p className="text-sm">{msg.content}</p>
                    </div>
                </div>
            ))
        )
    )
}