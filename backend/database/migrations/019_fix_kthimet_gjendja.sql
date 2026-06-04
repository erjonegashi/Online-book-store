-- Kthimet.gjendja ishte VARCHAR(50) pa constraint — po bëhet ENUM për data integrity
ALTER TABLE Kthimet
  MODIFY COLUMN gjendja ENUM('Pending','Approved','Completed','Rejected')
    NOT NULL DEFAULT 'Pending';
