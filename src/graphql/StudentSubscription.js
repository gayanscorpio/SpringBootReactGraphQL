import { useSubscription, gql } from '@apollo/client';
import React from 'react';

const STUDENT_ADDED = gql`
  subscription {
    studentAdded {
      id
      name
      email
    }
  }
`;

function StudentSubscription({ onNewStudent, nameFilter }) {
  const { data, error } = useSubscription(STUDENT_ADDED);

  React.useEffect(() => {
    if (data?.studentAdded) {
      const newStudent = data.studentAdded;
      console.log("Subscription event received:", newStudent);

      // Filter based on nameFilter before passing
      if (newStudent.name.toLowerCase().includes(nameFilter.toLowerCase())) {
        onNewStudent(newStudent);
      }
    }
  }, [data, onNewStudent, nameFilter]);

  React.useEffect(() => {
    if (error) {
      console.error('Subscription error:', error);
    }
  }, [error]);

  return null; // This component doesn't render anything visible
}

export default StudentSubscription;