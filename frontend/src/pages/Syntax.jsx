import React from 'react';
import Navbar from '@components/Nav/Navbar';

export default function Syntax() {
  return (
    <div className="min-h-screen bg-dark-500 flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        <iframe
          src="/syntax.html"
          title="SYLESS Language Reference"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 64px)' }}
        />
      </div>
    </div>
  );
}
