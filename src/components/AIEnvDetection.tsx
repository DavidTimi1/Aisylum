import { useEffect, useState } from "react";
import AIWarningModal from "./AIWarningModal";
import { useNavigate } from "react-router-dom";
import { checkAIAvailability } from "@/lib/built-in-ai";
import useActivityStore from "@/stores/activityStore";


const AIEnvDetection = ({ required = [], children }: {
    required: string[];
    children: React.ReactNode;
}) => {
  const [missingModels, setMissingModels] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const navigateTo = useNavigate();
  const {checkAllowedRemoteAI, addAllowedRemoteAI} = useActivityStore();

  useEffect(() => {
    async function detect() {
      const allStaus = await Promise.all( required.map((model) => {
            return checkAIAvailability(model);
        }
      ));

      const missing = required.filter((_, index) => {
        return allStaus[index] !== 'available';
      });

      if (missing.length){
        setMissingModels(missing);
        setModalOpen(true);
      }
    }

    if (!checkAllowedRemoteAI(required)){
        detect();
    }
  }, [required]);

  const handleProceed = () => {
    setModalOpen(false);
    addAllowedRemoteAI(required);
  };

  const handleCancel = () => {
    navigateTo("/");
  };

  return (
    <>
      {modalOpen && (
        <AIWarningModal
          missing={missingModels}
          onContinue={handleProceed}
          onCancel={handleCancel}
        />
      )}

      {/* Content stays but blurred while warning is open */}
      <div className={`${modalOpen ? "blur-sm pointer-events-none" : ""}`}>
        {children}
      </div>
    </>
  );
};

export default AIEnvDetection;
