import { App } from "antd";

export const useNotify = () => {
  const { notification, message: msgApi, modal } = App.useApp();

  const success = (titleText: string, contentText?: string) => {
    notification.success({
      title: titleText,
      description: contentText,
      duration: 3,
    });
  };

  const error = (titleText: string, contentText?: string) => {
    notification.error({
      title: titleText,
      description: contentText,
    });
  };

  const warn = (titleText: string, contentText?: string) => {
    notification.warning({
      title: titleText,
      description: contentText,
    });
  };

  return { success, error, warn, message: msgApi, modal };
};
