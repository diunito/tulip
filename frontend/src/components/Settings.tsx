import { AdjustmentsIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCompressedLayout } from "../store/settings";
import { TulipRootState } from "../store";
import { Modal } from "./Mondal";

export function SettingsComponent() {
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();
  const compressedLayout = useSelector((state: TulipRootState) => state.settings.compressedLayout);

  const handleToggleLayout = () => {
    dispatch(updateCompressedLayout(!compressedLayout));
  };

  const openModal = () => {
    setShowModal(true);
  }

  const closeModal = () => {
    setShowModal(false);
  }

  return (
    <div>
      <button className="flex items-center justify-center" onClick={openModal}>
        <AdjustmentsIcon className="h-7 w-auto" />
      </button>

      <Modal show={showModal} title="Settings" onClose={closeModal}>
        <div className="flex flex-col">
          <label>
            <input
              type="checkbox"
              checked={compressedLayout}
              onChange={handleToggleLayout}
            />
            <span className="ml-3">
              Compressed Layout

            </span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
