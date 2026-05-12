-- Fix incorrect cover image for "Dyert e Perceptimit" (The Doors of Perception) by Aldous Huxley.
-- The old ISBN-based URL returned a wrong "Power Foods" cover from OpenLibrary.
-- Fix: use OpenLibrary cover ID 6622313, confirmed via the OpenLibrary search API.
-- This URL is cover-ID-based and immune to ISBN misassociation.
--
-- ALREADY APPLIED to the live database on 2026-05-11.
-- Keep this file for reference / re-seeding after a fresh schema import.

USE online_book_store;

UPDATE Librat
SET foto_url = 'https://covers.openlibrary.org/b/id/6622313-L.jpg'
WHERE titulli = 'Dyert e Perceptimit';

-- Verify:
SELECT liber_id, titulli, isbn, foto_url
FROM Librat
WHERE titulli = 'Dyert e Perceptimit';
