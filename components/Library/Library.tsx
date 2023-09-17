"use client";
import React from "react";
import { TbPlaylist } from "react-icons/tb";
import { AiOutlinePlus } from "react-icons/ai";

const Library = () => {
  const onClick = () => {};
  return (
    <div className="flex flex-col">
      <div className="flex px-5 items-center pt-4 justify-between">
        <div className="inline-flex gap-x-2 items-center">
          <TbPlaylist size={25} className="text-neutral-400" />
          <p className="text-base font-medium text-neutral-500">Your library</p>
        </div>
        <AiOutlinePlus
          onClick={onClick}
          size={25}
          className="cursor-pointer text-neutral-500 hover:text-white transition"
        />
      </div>
      <div className="flex-col gap-y-2 mt-4 px-2">List of songs</div>
    </div>
  );
};

export default Library;
