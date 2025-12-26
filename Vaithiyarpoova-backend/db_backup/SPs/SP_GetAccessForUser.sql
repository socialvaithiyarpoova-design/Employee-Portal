DROP PROCEDURE IF EXISTS SP_GetAccessForUser;
DELIMITER $$
CREATE PROCEDURE SP_GetAccessForUser(IN p_user_id INT)
BEGIN
  SELECT
    m.menu_id,
    m.name,
    aum.active_btn,
    aum.inactive_btn,
    aum.view_btn,
    aum.upload_btn,
    aum.search_btn,
    aum.sort_btn,
    aum.filter_btn,
    aum.suffle_btn,
    aum.export_btn,
    aum.add_btn,
    aum.edit_btn,
    aum.delete_btn
  FROM menu m
  JOIN access_user_menu aum
    ON aum.menu_id = m.menu_id
   AND aum.user_id = p_user_id
  WHERE m.exact = 0
  ORDER BY m.menu_id;
END$$
DELIMITER ;