import { supportedLanguages } from "@/lib/languageModules";
import useActivityStore from "@/stores/activityStore"
import { formatDistanceToNow } from "date-fns";
import { BookOpenTextIcon, ChevronRightIcon, FileIcon, MessageSquareIcon } from "lucide-react"
import { useNavigate } from "react-router-dom";


const recentActivity = [
    {
        id: 1,
        icon: MessageSquareIcon,
        title: 'Conversation about local services',
        subtitle: 'AI Chat',
        timestamp: '2 hours ago'
    },
    {
        id: 2,
        icon: FileIcon,
        title: 'Draft for Asylum Application',
        subtitle: 'Document Helper',
        timestamp: '1 day ago'
    }
]

export const RecentActivity = () => {
    const getRecentActivities = useActivityStore(s => s.getRecentActivities);
    const recentActivities = getRecentActivities();
    const navigateTo = useNavigate();

    if (!recentActivities.length) return null;

    return (
        <section>
            <h2 className="text-2xl font-bold text-foreground mb-2 montserrat-font">
                Your Recent Activity
            </h2>

            <p className="text-foreground-light mb-6">
                Pick up where you left off.
            </p>

            <div className="bg-background/50 rounded-xl border px-2 border-foreground/10 divide-y divide-foreground/10">
                {
                    recentActivities.map((activityData) => {
                        const activity = getActivityInfo(activityData);
                        if (!activity) return

                        return (
                            <ActivityItem
                                key={activityData.type}
                                icon={activity.icon}
                                title={activity.title}
                                subtitle={activity.subtitle}
                                timestamp={activity.timestamp}
                                onClick={activity.handleClick}
                            />
                        )
                    })
                }
            </div>
        </section>
    )

    function getActivityInfo(activityData) {
        const timestamp = formatDistanceToNow(activityData.data.timestamp);
        if (activityData.type === 'chat'){
            return {
                icon: MessageSquareIcon,
                title: `Conversation on ${activityData.data.name}`,
                subtitle: 'AI Chat',
                timestamp,
                handleClick: () => {
                    navigateTo( 'chat', { state: {chat: activityData.data.chatId} })
                }
            }
        }
        
        if (activityData.type === 'document'){
            return {
                icon: FileIcon,
                title: `${activityData.data.action} ${activityData.data.docName}`,
                subtitle: 'Document Helper',
                timestamp,
                handleClick: () => {
                    navigateTo( 'documents', { state: {document: activityData.data.docId} })
                }
            }
        }
        
        if (activityData.type === 'language'){
            return {
                icon: BookOpenTextIcon,
                title: `Module ${activityData.data.module} of your ${ supportedLanguages[activityData.data.languageCode] } lesson`,
                subtitle: 'Language Tools',
                timestamp,
                handleClick: () => {
                    navigateTo( 'language', { state: {language: activityData.data.languageCode} })
                } 
            }
        }
        return null
    }
}



const ActivityItem = ({ icon: Icon, title, subtitle, timestamp, onClick }) => (
    <button
        onClick={onClick}
        className="group cursor-pointer w-full flex items-center justify-between p-4 hover:bg-background/50 transition-colors"
    >
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                {/* Icon color: text-foreground-light */}
                <Icon className="w-5 h-5 text-foreground-light" />
            </div>
            <div className="text-left">
                <h4 className="text-sm font-medium text-foreground montserrat-font">
                    {title}
                </h4>
                <p className="text-xs text-foreground-light">
                    {subtitle} · {timestamp}
                </p>
            </div>
        </div>
        {/* Chevron: text-foreground-light */}
        <ChevronRightIcon className="w-5 h-5 text-foreground-light group-hover:translate-x-1 transition-transform" />
    </button>
);
