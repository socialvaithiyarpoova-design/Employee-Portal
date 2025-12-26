DROP PROCEDURE IF EXISTS SP_SeedAccessUserMenuForUser;
DELIMITER $$
CREATE PROCEDURE SP_SeedAccessUserMenuForUser(
  IN p_user_id INT,
  IN p_usertype_id INT
)
BEGIN
  INSERT INTO access_user_menu (
    user_id, menu_id,
    active_btn, inactive_btn,
    view_btn, upload_btn, search_btn, sort_btn, filter_btn, suffle_btn,
    export_btn, add_btn, edit_btn, delete_btn
  )
  SELECT
    p_user_id, um.menu_id,
    0 AS active_btn, 0 AS inactive_btn,         
    um.view_btn, um.upload_btn, um.search_btn, um.sort_btn, um.filter_btn, um.suffle_btn,
    um.export_btn, um.add_btn, um.edit_btn, um.delete_btn
  FROM user_menu um
  WHERE um.usertype_id = p_usertype_id
  ON DUPLICATE KEY UPDATE
    active_btn   = VALUES(active_btn),
    inactive_btn = VALUES(inactive_btn),
    view_btn     = VALUES(view_btn),
    upload_btn   = VALUES(upload_btn),
    search_btn   = VALUES(search_btn),
    sort_btn     = VALUES(sort_btn),
    filter_btn   = VALUES(filter_btn),
    suffle_btn   = VALUES(suffle_btn),
    export_btn   = VALUES(export_btn),
    add_btn      = VALUES(add_btn),
    edit_btn     = VALUES(edit_btn),
    delete_btn   = VALUES(delete_btn);
END$$
DELIMITER ;