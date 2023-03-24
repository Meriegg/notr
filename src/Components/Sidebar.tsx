import { signOut, useSession } from "next-auth/react";
import { IconChevronsRight, IconChevronsLeft, IconMenu } from "@tabler/icons-react";
import { faHome, faSearch, faSignIn, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  createStyles,
  Navbar,
  TextInput,
  Code,
  UnstyledButton,
  rem,
  Loader,
  Button,
  Box,
  Flex,
  Divider,
  Text,
  Highlight,
  Badge,
} from "@mantine/core";
import Link from "next/link";
import { UserButton } from "./UserInfo";
import { useEffect, useState } from "react";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { useSearch } from "@/lib/zustand/useSearch";
import { api } from "@/utils/api";

const useStyles = createStyles((theme) => ({
  navbar: {
    paddingTop: 0,
    height: "100%",
    zIndex: 60,
  },
  section: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    marginBottom: theme.spacing.md,

    "&:not(:last-of-type)": {
      borderBottom: `${rem(1)} solid ${
        theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
      }`,
    },
  },
  searchCode: {
    fontWeight: 700,
    fontSize: rem(10),
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0],
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[2]
    }`,
  },
  mainLinks: {
    paddingLeft: `calc(${theme.spacing.xl} - ${theme.spacing.xs})`,
    paddingRight: `calc(${theme.spacing.xl} - ${theme.spacing.xs})`,
    paddingBottom: theme.spacing.md,
  },
  mainLink: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    fontSize: theme.fontSizes.xs,
    padding: `${rem(8)} ${theme.spacing.xs}`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],

    "&:hover": {
      backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },
  mainLinkInner: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  mainLinkIcon: {
    marginRight: theme.spacing.sm,
    color: theme.colorScheme === "dark" ? theme.colors.dark[2] : theme.colors.gray[6],
  },
}));

const links = [{ icon: faHome, label: "Home", href: "/" }];

export function Sidebar() {
  const isTablet = useMediaQuery("(max-width: 726px)", true);
  const isMobile = useMediaQuery("(max-width: 556px)", false);
  const navbarOpenWidth = isMobile ? "100%" : "300px";
  const navbarClosedWith = "150px";
  const { classes } = useStyles();
  const { setResults, setError, setLoading, setQuery, clearQuery } = useSearch();
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isOpen, setOpen] = useState(!isTablet);
  const [localQuery, setLocalQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(localQuery, 200);
  const { status, data } = useSession();
  const searchQuery = api.notes.searchNotes.useQuery(
    {
      query: debouncedQuery || "",
    },
    {
      enabled: debouncedQuery ? true : false,
    }
  );

  useEffect(() => {
    setError({
      active: searchQuery.isError,
      message: searchQuery.error?.message || null,
    });
    setLoading(searchQuery.isLoading);

    if (!searchQuery.isLoading && !searchQuery.isError) {
      setResults(searchQuery.data);
    }
  }, [searchQuery.isLoading, searchQuery.isError, searchQuery.data]);

  useEffect(() => {
    setQuery(debouncedQuery.trim() ? debouncedQuery : null);
  }, [debouncedQuery]);

  const mainLinks = links.map((link) => (
    <UnstyledButton component={Link} key={link.label} href={link.href} className={classes.mainLink}>
      <div className={classes.mainLinkInner}>
        <FontAwesomeIcon className={classes.mainLinkIcon} icon={link.icon} />
        <span>{link.label}</span>
      </div>
    </UnstyledButton>
  ));

  useEffect(() => {
    setOpen(!isTablet);
  }, [!isTablet]);

  return (
    <>
      <Navbar
        p="md"
        className={classes.navbar}
        pos={isMobile ? "fixed" : "relative"}
        left={0}
        top={0}
        style={{
          height: "auto",
          transform: `translateX(${!isMobile || isMobileOpen ? "0px" : "-100%"})`,
          minWidth: isOpen ? navbarOpenWidth : navbarClosedWith,
          maxWidth: isOpen ? navbarOpenWidth : navbarClosedWith,
          transition: "all .3s ease",
        }}
      >
        <Box pos="sticky" top="1rem" h="100%">
          <Navbar.Section className={classes.section}>
            {status === "loading" && <Loader size="sm" w={"100%"} />}
            {status === "unauthenticated" && (
              <Box px="sm" mb="sm">
                <Button rightIcon={<FontAwesomeIcon icon={faSignIn} />} color="dark" fullWidth>
                  Log In
                </Button>
              </Box>
            )}
            {status === "authenticated" && (
              <Flex justify="space-between" align="center">
                <UserButton
                  image={data.user.image}
                  name={data.user.name || ""}
                  email={data.user.email || ""}
                  hideData={!isOpen}
                />
                <Button
                  onClick={() => setOpen(!isOpen)}
                  variant="subtle"
                  color="gray"
                  size="sm"
                  px="sm"
                  mr="sm"
                >
                  {!isOpen ? <IconChevronsRight size="1rem" /> : <IconChevronsLeft size="1rem" />}
                </Button>
              </Flex>
            )}
          </Navbar.Section>

          <TextInput
            placeholder="Search"
            size="xs"
            icon={<FontAwesomeIcon icon={faSearch} />}
            rightSectionWidth={isOpen ? 70 : 0}
            onChange={(e) => setLocalQuery(e.target.value)}
            value={localQuery}
            styles={{ rightSection: { pointerEvents: "none" } }}
            mb="sm"
          />

          {debouncedQuery ? (
            <Navbar.Section className={classes.section} mt="md">
              <div className={classes.mainLinks}>
                <Divider label="Search results" labelPosition="center" />
                <Flex align="center" justify="space-between" w="100%" mb="lg">
                  <Text size="sm" mt="0.125rem">
                    query: {debouncedQuery}
                  </Text>
                  <Text size="sm" mt="0.125rem">
                    tags: none
                  </Text>
                </Flex>

                {searchQuery.data?.rankedResults.map((result, idx) => {
                  const titleMatchString = result.titleMatches
                    ? result.titleMatches
                        .map((match) =>
                          typeof match === "object"
                            ? match.map((matchMatch) => matchMatch.toLowerCase())
                            : (match as string).toLowerCase()
                        )
                        .join(" ")
                    : "";

                  return (
                    <UnstyledButton
                      key={idx}
                      component={Link}
                      href={`/note/${result.note.id}`}
                      className={classes.mainLink}
                    >
                      <div
                        className={classes.mainLinkInner}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        <Highlight highlight={titleMatchString}>
                          {result.note.title || "Untitled"}
                        </Highlight>

                        <Badge size="sm" color={result.matchCount > 10 ? "yellow" : "cyan"}>
                          {result.matchCount} MATCH(ES)
                        </Badge>
                      </div>
                    </UnstyledButton>
                  );
                })}
              </div>
            </Navbar.Section>
          ) : (
            <Navbar.Section className={classes.section}>
              <div className={classes.mainLinks}>{mainLinks}</div>
            </Navbar.Section>
          )}
        </Box>
        {status === "authenticated" && !debouncedQuery && (
          <Navbar.Section pos="sticky" left="20px" bottom="85vh" h="100%">
            <Button
              color="dark"
              rightIcon={<>{!isOpen ? null : <FontAwesomeIcon icon={faSignOut} />}</>}
              onClick={() => signOut()}
              fullWidth
            >
              {isOpen ? "Log out" : <FontAwesomeIcon icon={faSignOut} />}
            </Button>
          </Navbar.Section>
        )}
      </Navbar>
      {isMobile && (
        <Button
          pos="fixed"
          bottom="20px"
          left="20px"
          w="fit-content"
          style={{
            zIndex: "50",
            transform: `translateX(${isMobileOpen ? "100%" : "0px"})`,
            transition: "all .3s ease !important",
          }}
          color="dark"
          onClick={() => setMobileOpen(!isMobileOpen)}
          leftIcon={
            <>{isMobileOpen ? <IconChevronsLeft size="1rem" /> : <IconMenu size="1rem" />}</>
          }
        >
          {isMobileOpen ? "Collapse Menu" : "Open Menu"}
        </Button>
      )}
    </>
  );
}
