import { Button, Typography } from 'antd';
import {
  MenuFoldOutlined, MenuOutlined, MenuUnfoldOutlined
} from '@ant-design/icons';

const AdminTopbar = ({ title, onMenu, collapsed, onCollapse }) => (
  <div className="admin-portal-topbar">
    <div className="admin-portal-topbar-leading">
      <Button className="admin-ant-mobile" type="text" icon={<MenuOutlined />} onClick={onMenu} aria-label="Open admin navigation" />
      <Button className="admin-ant-desktop" type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={onCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} />
      <div className="admin-portal-title">
        <Typography.Text>ADMIN PANEL</Typography.Text>
        <Typography.Title level={4}>{title}</Typography.Title>
      </div>
    </div>
  </div>
);

export default AdminTopbar;
