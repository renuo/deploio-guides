import React from "react";

export default function AdmonitionIconNote(props) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <mask id="mask0_1286_3336" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="24"
                  height="24">
                <rect width="24" height="24" fill="#D9D9D9"/>
            </mask>
            <g mask="url(#mask0_1286_3336)">
                <path d="M5 19H14V14H19V5H5V19ZM3 21V3H21V15L15 21H3ZM7 14V12H12V14H7ZM7 10V8H17V10H7Z" fill="#141D50"/>
            </g>
        </svg>
    );
}
