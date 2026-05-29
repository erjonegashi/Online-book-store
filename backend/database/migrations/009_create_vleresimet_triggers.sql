DELIMITER //

DROP TRIGGER IF EXISTS trg_vleresimet_before_insert //
CREATE TRIGGER trg_vleresimet_before_insert
BEFORE INSERT ON Vleresimet
FOR EACH ROW
BEGIN
  IF NEW.nota NOT BETWEEN 1 AND 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Nota duhet te jete ndermjet 1 dhe 5';
  END IF;
END //

DROP TRIGGER IF EXISTS trg_vleresimet_before_update //
CREATE TRIGGER trg_vleresimet_before_update
BEFORE UPDATE ON Vleresimet
FOR EACH ROW
BEGIN
  IF NEW.nota NOT BETWEEN 1 AND 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Nota duhet te jete ndermjet 1 dhe 5';
  END IF;
END //

DELIMITER ;
