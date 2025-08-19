import React from 'react';

export default function Footer() {
	return (
		<footer className="fixed bottom-0 left-0 w-full h-16 bg-gray-50" style={{ boxShadow: '0 -1px 5px rgba(0,0,0,0.08)' }}>
			<div className="container mx-auto px-4 text-sm text-gray-600 flex items-center justify-center h-full">
				<div>Connectly — Bringing Volunteers and Organizations Together.</div>
				<div className="ml-4">© {new Date().getFullYear()} Connectly</div>
			</div>
		</footer>
	);
}
