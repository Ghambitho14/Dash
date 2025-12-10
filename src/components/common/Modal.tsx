import { ReactNode } from 'react';
import '../../styles/Components/common/Modal.css';

interface ModalProps {
	children: ReactNode;
	onClose: () => void;
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function Modal({ children, onClose, maxWidth = '2xl' }: ModalProps) {
	return (
		<div className="modal-overlay" onClick={onClose}>
			<div 
				className={`modal-content modal-content-${maxWidth}`}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
}

