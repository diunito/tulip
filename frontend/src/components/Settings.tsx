import { AdjustmentsIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCompressedLayout, updateHideDiff, updateHideCurrent } from "../store/settings";
import { TulipRootState } from "../store";
import { Modal } from "./Mondal";

// TODO we can generalize this
export function SettingsComponent() {
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();
  const compressedLayout = useSelector((state: TulipRootState) => state.settings.compressedLayout);
  const hideCurrent = useSelector((state: TulipRootState) => state.settings.hideCurrent);
  const hideDiff = useSelector((state: TulipRootState) => state.settings.hideDiff);

  const handleToggleLayout = () => {
    dispatch(updateCompressedLayout(!compressedLayout));
  };

  const handleDiffHide = () => {
    dispatch(updateHideDiff(!hideDiff));
  };

  const handleCurrHide = () => {
    dispatch(updateHideCurrent(!hideCurrent));
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
          <label>
            <input
              type="checkbox"
              checked={hideDiff}
              onChange={handleDiffHide}
            />
            <span className="ml-3">
              Hide diff
            </span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={hideCurrent}
              onChange={handleCurrHide}
            />
            <span className="ml-3">
              Hide current
            </span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
