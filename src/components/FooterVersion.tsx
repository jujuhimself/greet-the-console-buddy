
import React from "react";

const APP_VERSION = "v1.0.0"; // In a real app, this could be injected at build-time

export const FooterVersion = () => (
  <footer className="w-full flex justify-center items-center py-2 mt-8 text-xs bg-gray-50 border-t text-gray-700">
    <span className="mr-2">BEPAWA</span>
    <span className="text-gray-400">|</span>
    <span className="ml-2">App Version: {APP_VERSION}</span>
  </footer>
);

