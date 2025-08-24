import React, { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';

const BORROWED_BOOKS_BY_STUDENT = gql`
  query($studentId: ID!, $page: Int, $size: Int) {
    borrowedBooksByStudent(studentId: $studentId, page: $page, size: $size) {
      content {
        id
        borrowDate
        dueDate
        returnDate
        fineAmount
        book {
          title
          author
        }
      }
      totalPages
      number
    }
  }
`;


function StudentBooks() {
    const { id: studentId } = useParams();
    const [page, setPage] = useState(0);

    const { loading, error, data, refetch } = useQuery(BORROWED_BOOKS_BY_STUDENT, {
        variables: { studentId, page, size: 5 },
    });

    useEffect(() => {
        refetch({ studentId, page, size: 5 });
    }, [page, studentId, refetch]);

    if (!data?.borrowedBooksByStudent) return <p>Loading or no data</p>;
    const books = data.borrowedBooksByStudent.content;

    if (error) return <p>Error: {error.message}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Borrowed Books for Student ID: {studentId}</h2>

            <Link to="/students" style={{ textDecoration: 'underline', color: 'blue' }}>
                ← Back to Students
            </Link>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}

            {books.length === 0 ? (
                <p>No books borrowed.</p>
            ) : (
                <>
                    <ul>
                        {books.map((b) => (
                            <li key={b.id}>
                                📚 <strong>{b.book.title}</strong> by {b.book.author} <br />
                                Borrowed: {b.borrowDate}, Due: {b.dueDate}, Returned: {b.returnDate || 'Not returned'}<br />
                                Fine: ₹{b.fineAmount}
                            </li>
                        ))}
                    </ul>

                    {/* Pagination controls go here */}
                    <div style={{ marginTop: '20px' }}>
                        <button onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>
                            Prev
                        </button>

                        <span style={{ margin: '0 10px' }}>
                            Page {data?.borrowedBooksByStudent?.number + 1} of {data?.borrowedBooksByStudent?.totalPages}
                        </span>

                        <button
                            onClick={() =>
                                setPage((p) =>
                                    data?.borrowedBooksByStudent?.number + 1 < data?.borrowedBooksByStudent?.totalPages ? p + 1 : p
                                )
                            }
                            disabled={data?.borrowedBooksByStudent?.number + 1 >= data?.borrowedBooksByStudent?.totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default StudentBooks;
