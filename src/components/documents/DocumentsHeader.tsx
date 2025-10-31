import React from 'react';
import { CheckCircle2Icon } from 'lucide-react';

const DocumentsHeader: React.FC = () => {
    return (
        <div className="mb-8">
            <h1 className="text-2xl text-foreground montserrat-font mb-2">Documents</h1>
            <p className="text-foreground/60 mb-6">
                Manage, translate, and summarize your documents privately
            </p>

            {/* <div className="w-max mx-auto max-w-full">
                <div className="bg-primary/20 border border-primary/40 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2Icon className="h-4 w-4 text-primary" />
                    <p className="text-sm text-foreground">
                        <span className="font-semibold">100% Private & Offline.</span> All document processing
                        happens on your device. Your files never leave this browser.
                    </p>
                </div>
            </div> */}
        </div>
    );
};

export default DocumentsHeader;
