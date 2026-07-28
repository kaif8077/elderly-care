const elderlyCareTheme = {
  cssVar: true,
  token: {
    colorPrimary: '#0066ff', colorPrimaryHover: '#0052cc', colorPrimaryActive: '#0047b3',
    colorLink: '#0066ff', colorLinkHover: '#0052cc', colorLinkActive: '#0047b3',
    colorInfo: '#0066ff', colorSuccess: '#0066ff', colorWarning: '#ff6b00', colorError: '#ff6b00',
    colorText: '#1f2937', colorTextSecondary: '#667085', colorBgLayout: '#f6f8fc', colorBgContainer: '#ffffff', colorBorder: '#d8dee9',
    borderRadius: 10, borderRadiusLG: 16, controlHeight: 36, fontSize: 15,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", boxShadowSecondary: '0 18px 48px rgba(18, 63, 53, 0.12)'
  },
  components: {
    Button: { fontWeight: 700, primaryShadow: 'none', defaultHoverColor: '#0052cc', defaultHoverBorderColor: '#0052cc' }, Card: { headerBg: '#ffffff' },
    Layout: { bodyBg: '#f3f7f5', headerBg: '#ffffff', siderBg: '#0066ff' },
    Menu: {
      itemColor: '#1f2937', itemHoverColor: '#0052cc', itemSelectedColor: '#0066ff',
      horizontalItemHoverColor: '#0052cc', horizontalItemSelectedColor: '#0066ff',
      darkItemBg: '#0066ff', darkItemSelectedBg: '#ffffff',
      darkItemSelectedColor: '#0066ff', darkItemHoverBg: '#0052cc'
    },
    Table: { headerBg: '#f3f6fc', headerColor: '#1f2937' }
  }
};
export default elderlyCareTheme;
