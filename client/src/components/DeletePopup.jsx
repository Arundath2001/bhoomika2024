import React from "react";
import './DeletePopup.css';
import ButtonNormal from "./ButtonNormal";

function DeletePopup({ onCancel, onDelete }) {
    return (
        <div className="deletepopup">
            <p className="deletepopup_head">Are you certain you want to delete this data?</p>

            <div className="deletepopup_btns">
                <ButtonNormal btn_color="btn_white" text="Cancel" onClick={onCancel} />
                <ButtonNormal btn_color="btn_red" text="Delete" onClick={onDelete} />
            </div>
        </div>
    );
}

export default DeletePopup;
