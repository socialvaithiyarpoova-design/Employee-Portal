import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';
import { FiCalendar } from 'react-icons/fi';
import PropTypes from 'prop-types';

function CustomDateRangePicker({ onDateChange , className , btnClass}) {
    const [showPicker, setShowPicker] = useState(false);
    const [range, setRange] = useState(null); // Finalized range
    const [tempRange, setTempRange] = useState(null); // Temporary range while selecting
    const pickerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        }

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    const handleApply = () => {
        setRange(tempRange);
        onDateChange?.(tempRange);
        setShowPicker(false);
    };

    const handleCancel = () => {
        setTempRange(range); // Reset temp to current selection
        setShowPicker(false);
    };

    const handleOpenPicker = () => {
        setTempRange(range ?? {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        });
        setShowPicker(true);
    };

    const getButtonLabel = () => {
        if (range?.startDate && range?.endDate) {
            return `${format(range.startDate, 'dd/MM/yyyy')} - ${format(range.endDate, 'dd/MM/yyyy')}`;
        }
        return 'Select From & To Date';
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} className={className} >
            <button
               className={`date-btn datepicker-btn-cm w-100 ${btnClass || ''}`}
                onClick={handleOpenPicker}
            >
                <FiCalendar size={18} />
                {getButtonLabel()}
            </button>

            {showPicker && (
                <div
                    ref={pickerRef}
                    className='showpicker-cm'
                >
                    <DateRange
                        editableDateInputs={true}
                        onChange={(item) => setTempRange(item.selection)}
                        moveRangeOnFirstSelection={false}
                        ranges={[tempRange]}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                        <button onClick={handleCancel} className='datepick-nocm-st'>
                            Cancel
                        </button>
                        <button onClick={handleApply} className='datepick-okcm-st' >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

CustomDateRangePicker.propTypes = {
    onDateChange: PropTypes.func.isRequired, // or PropTypes.func if not required
};

export default CustomDateRangePicker;
