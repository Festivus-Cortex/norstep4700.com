import { Flex, IconButton, SmartLink, Text } from "@/once-ui/components";
import { person, social } from "@/app/resources/content";
import styles from "./Footer.module.scss";
import { routes } from "@/app/resources";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Flex
      as="footer"
      position="relative"
      fillWidth
      padding="8"
      horizontal="center"
      mobileDirection="column"
    >
      <Flex
        className={styles.mobile}
        maxWidth="m"
        paddingY="8"
        paddingX="16"
        gap="16"
        horizontal="space-between"
        vertical="center"
      >
        <Text variant="body-default-s" onBackground="neutral-strong">
          <Text onBackground="neutral-weak">© {currentYear} /</Text>
          <Text paddingX="4">{person.name}</Text>

          {
            /* If the explicit license page is on then reference that. */
            routes["/license"] && (
              <Text onBackground="neutral-weak">
                with help from<SmartLink href="/license">licensed</SmartLink>
                content
              </Text>
            )
          }
          {
            /* If the explicit license page is not turned on then give the fall back attribution here. */
            !routes["/license"] && (
              <Text onBackground="neutral-weak">
                {/* Usage of this template requires attribution. Please don't remove the link to Once UI. */}
                / Build your portfolio with{" "}
                <SmartLink
                  style={{ marginLeft: "-0.125rem" }}
                  href="https://once-ui.com/templates/magic-portfolio"
                >
                  Once UI
                </SmartLink>
              </Text>
            )
          }
        </Text>
        <Flex gap="16">
          {social.map(
            (item) =>
              item.link && (
                <IconButton
                  key={item.name}
                  href={item.link}
                  icon={item.icon}
                  tooltip={item.name}
                  size="s"
                  variant="ghost"
                />
              )
          )}
        </Flex>
      </Flex>
      <Flex height="80" show="s"></Flex>
    </Flex>
  );
};
